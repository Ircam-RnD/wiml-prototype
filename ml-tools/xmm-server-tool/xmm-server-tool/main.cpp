//
//  main.cpp
//  xmm-server-tool
//
//  Created by Joseph Larralde on 09/02/16.
//
//

#include <cstdlib>
#include <iostream>
#include <sstream>

#include "xmmMongoClient.hpp"
#include "gmmServerTool.hpp"
#include "hhmmServerTool.hpp"

// TODO : create some mutex system to prevent concurrent R/W accesses from node and C drivers
// (passing messages through stdin and stdout ?)
// or is it already done at mongod level ? -> CHECK THIS OUT !!!

typedef enum { XmmOk = 0, XmmEmptySet, XmmConfigProblem, XmmTrainProblem }       XmmOperationResultE;
typedef enum { XmmUnknownModelType = -1, XmmGmm = 0, XmmGmr, XmmHhmm, XmmHhmr } XmmModelTypeE;

static XmmModelTypeE modelFromString(std::string smodel) {
    XmmModelTypeE model;
    if(smodel.compare("gmm") == 0) {
        model = XmmGmm;
    } else if(smodel.compare("hhmm") == 0) {
        model = XmmHhmm;
    } else {
        model = XmmUnknownModelType;
    }
    return model;
}

//==================== GLUE CLASS ====================//

class xmmServerDriver {

    xmmMongoClient mongoClient;
    gmmServerTool gmmTool;
    hhmmServerTool hhmmTool;
    unsigned int nbGaussians;
    unsigned int nbStates;

public:
    
    xmmServerDriver() {
        mongoClient.connect();
        nbGaussians = 3;
        nbStates    = 10;
    }
    
    ~xmmServerDriver() {
        mongoClient.close();
    };
    
    XmmOperationResultE configureModels(XmmModelTypeE model, unsigned int nbGaussians, unsigned int nbStates,
                         double relReg, double absReg) {
        
        xmmServerToolBase *tool;
        switch(model) {
            case XmmGmm:
                tool = &gmmTool;
                break;
                
            case XmmHhmm:
                hhmmTool.setNbStates(nbStates);
                tool = &hhmmTool;
                break;
                
            default:
                return XmmConfigProblem;
                //break;
        }
        tool->setNbGaussians(nbGaussians);
        tool->setRelativeRegularization(relReg);
        tool->setAbsoluteRegularization(absReg);
        
        return XmmOk;
    }
    
    XmmOperationResultE trainModels(XmmModelTypeE model,
                                    std::string db, std::string srcColl, std::string dstColl,
                                    std::vector<std::string> labels, std::vector<std::string> colnames) {
        
        std::string smodels;
        std::vector<std::string> phrases = mongoClient.fetchPhrases(db, srcColl, labels, colnames);
        if(phrases.size() == 0) {
            return XmmEmptySet;
        }
        
        xmmServerToolBase *tool;
        switch(model) {
            case XmmGmm:
                tool = &gmmTool;
                break;
                
            case XmmHhmm:
                hhmmTool.setNbStates(nbStates);
                tool = &hhmmTool;
                break;
                
            default:
                return XmmTrainProblem;
                //break;
        }
        tool->clearTrainingSet();
        tool->addToTrainingSet(phrases);
        tool->train();
        smodels = tool->toString();

        mongoClient.writeModelsToDatabase(db, dstColl, smodels);
        
        return XmmOk;
    }
    
    void printModels(XmmModelTypeE model) {
        xmmServerToolBase *tool;
        switch(model) {
            case XmmGmm:
                tool = &gmmTool;
                break;
            case XmmHhmm:
                tool = &hhmmTool;
                break;
            default:
                return;
        }
        
        std::vector<std::string> phrases = mongoClient.task(XmmMongoGet);
        
        tool->clearTrainingSet();
        tool->addToTrainingSet(phrases);
        tool->train();
        
        Json::StyledWriter sw;
        std::string smodels = sw.write(tool->toJson());
        std::cout << smodels << std::endl;
    }
    
    /* ====================== useless ===================== */
    
    // TODO : remove (just here for test)
    std::string getLastPhrase() {
        std::vector<std::string> cn;
        cn.push_back(std::string("magnitude"));
        cn.push_back(std::string("frequency"));
        cn.push_back(std::string("periodicity"));
        std::vector<std::string> labs;
        labs.push_back(std::string("Run"));
        
        std::vector<std::string> phrases = mongoClient.fetchPhrases(std::string("wimldb"), std::string("phrases"), labs, cn);
        if(phrases.size() > 0) {
            std::cout << "ok" << std::endl;
            return phrases[phrases.size() - 1];
        } else {
            std::cout << "no phrases" << std::endl;
            return "";
        }
    }
    
    // TODO : also remove this one
    void getModels() {
        // do this from node instead of here
    }
    
private:
    
};

//============================ COMMAND-LINE PARSING UTILITY =============================//

/*
 *  parses the incoming command line :
 *  - command and args will be put in the 1st vector of strings
 *  - options (beginning with "--") and their args will be respectively put in the following vectors
 */
 
std::vector<std::vector<std::string>> split(const std::string &s, char delim)
{
    std::vector<std::vector<std::string>> cmd;
    std::stringstream ss(s);
    std::string item;
    std::vector<std::string> chunk;
    while(std::getline(ss, item, ' ')) {
        if(!item.empty()) {
            if(item.length() > 1 && item[0] == '-' && item[1] == '-') {
                std::vector<std::string> chunk_copy(chunk);
                cmd.push_back(chunk_copy);
                chunk.clear();
            }
            chunk.push_back(item);
        }
    }
    cmd.push_back(chunk); // push last one
    
    return cmd;
}

//===================================== MAIN LOOP ======================================//

int main(int argc, char * argv[]) {
    
    std::string input;
    xmmServerDriver driver;
    
    driver.configureModels(XmmHhmm, 1, 10, 0.01, 0.00001);
    std::vector<std::string> labels = {"Still", "Run", "Walk"};
    std::vector<std::string> colnames = {"magnitude", "frequency", "periodicity"};
    driver.trainModels(XmmHhmm, "wimldb", "phrases", "hhmmModels", labels, colnames);
    driver.printModels(XmmHhmm);

    //std::cout << "xmm-server-tool has been launched\n" << std::endl;
    
    for(;;) {
        
        getline(std::cin, input);
        std::cin.clear();
        
        if(!input.empty()) {
        //if(input.compare("") != 0) {
            
            //====================== split input string into args : =====================//
            
            std::vector<std::vector<std::string>> args = split(input, ' ');
            
            //============== route commands + deal with  options / arguments ============//
            
            // MANDATORY params  : dbName srcCollName dstCollName
            // MANDATORY options : --labels --colnames --sender

            //-------------------------------------------------------------//
            if(args[0].size() > 4 && args[0][0].compare("train") == 0) {
                
                // parse labels and colnames :
                // TODO : write a function to optimize options / args parsing
                
                XmmModelTypeE model = modelFromString(args[0][1]);
                std::string db  = args[0][2];
                std::string src = args[0][3];
                std::string dst = args[0][4];

                std::vector<std::string> labels;
                std::vector<std::string> colnames;
                std::string sender = "";
                
                //for(int i=0; i<args.size(); i++) {
                for(int i=1; i<args.size(); i++) {
                    if(args[i].size() > 0) {
                        std::string opt = args[i][0];
                        if(opt.compare("--labels") == 0) {
                            labels = std::vector<std::string>(args[i]);
                            labels.erase(labels.begin());
                        }
                        else if(opt.compare("--colnames") == 0) {
                            colnames = std::vector<std::string>(args[i]);
                            colnames.erase(colnames.begin());
                        }
                        else if(opt.compare("--sender") == 0 && args[i].size() > 1) {
                            sender = args[i][1];
                        }
                        else {
                            // unknown option, just ignore it
                        }
                    }
                }
                
                // new TrainingSet deals with empty labels / colnames
                /*
                std::cout << "db : " << db << ", src : " << src << ", dst : " << dst << std::endl;
                std::cout << "labels :";
                for(int i=0; i<labels.size(); i++) {
                    std::cout << " " << labels[i];
                }
                std::cout << std::endl;
                std::cout << "colnames :";
                for(int i=0; i<colnames.size(); i++) {
                    std::cout << " " << colnames[i];
                }
                std::cout << std::endl;
                */
                
                switch(driver.trainModels(model, db, src, dst, labels, colnames)) {
                    case XmmOk:
                        std::cout << "train ok --sender " << sender << std::endl;
                        break;
                        
                    case XmmEmptySet:
                        std::cout << "train emptyset --sender " << sender << std::endl;
                        break;
                        
                    default:
                        std::cout << "train unknownerror --sender " << sender << std::endl;
                        break;
                }
            }
            //-------------------------------------------------------------//
            else if(args[0].size() > 1 && args[0][0].compare("config") == 0) {
                
                // TODO : ALSO CHECK SENDER TO BE ABLE TO SEND THE RESPONSE TO THE RIGHT USER !!!!!!!!!!!!!!!!!!!!!!!!!
                
                XmmModelTypeE model = modelFromString(args[0][1]);
                int nbGaussians = 0;
                int nbStates = 0;
                double relReg = 0;
                double absReg = 0;
                std::string sender = "";
                
                for(int i=1; i<args.size(); i++) {
                    if(args[i].size() > 0) {
                        std::string opt = args[i][0];
                        if(opt.compare("--gaussians") == 0 && args[i].size() > 1) {
                            nbGaussians = std::stoi(args[i][1]);
                        }
                        else if(opt.compare("--states") == 0 && args[i].size() > 1) {
                            nbStates = std::stoi(args[i][1]);
                        }
                        else if(opt.compare("--relative_regularization") == 0 && args[i].size() > 1) {
                            relReg = std::stod(args[i][1]);
                        }
                        else if(opt.compare("--absolute_regularization") == 0 && args[i].size() > 1) {
                            absReg = std::stod(args[i][1]);
                        }
                        else if(opt.compare("--sender") == 0 && args[i].size() > 1) {
                            sender = args[i][1];
                        }
                    }
                }
                
                switch(driver.configureModels(model, nbGaussians, nbStates, relReg, absReg)) {
                    case XmmOk:
                        std::cout << "config ok --sender " << sender << std::endl;
                        break;
                        
                    default:
                        std::cout << "config unknownmodel --sender " << sender << std::endl;
                        break;
                }
            }
            //-------------------------------------------------------------//
            else if(args[0].size() > 0 && args[0][0].compare("echo") == 0) {
                //echo args;
                for(int i=0; i<args.size(); i++) {
                    for(int j=0; j<args[i].size(); j++) {
                        if(i == args.size() - 1 && j == args[i].size() - 1) {
                            std::cout << args[i][j] << std::endl;
                        } else if(i != 0 || j != 0) {
                            std::cout << args[i][j] << " ";
                        }
                    }
                }
            }
            //-------------------------------------------------------------//
            else if(args[0].size() > 0 && args[0][0].compare("quit") == 0) {
                //never happens, process supposed to be killed by host
                break;
            }
            //-------------------------------------------------------------//
            else if(args[0].size() > 0 && args[0][0].compare("phrase") == 0) {
                // for debug
                std::cout << driver.getLastPhrase() << std::endl;
            }
            //etc ...
            
            //std::cout << "received message " << input << " on stdin" << std::endl;
        }
    }

    return EXIT_SUCCESS;
}
