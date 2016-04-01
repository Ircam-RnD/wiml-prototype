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
//#include "hhmmServerTool.hpp"

// TODO : create some mutex system to prevent concurrent R/W accesses from node and C drivers
// (passing messages through stdin and stdout ?)
// or is it already done at mongod level ?

typedef enum { XmmOk = 0, XmmNoMatch, XmmTrainProblem }  XmmOperationE;

class xmmServerDriver {

    xmmMongoClient mongoClient;
    gmmServerTool gmmTool;
    //hhmmServerTool hhmm;

public:
    
    xmmServerDriver() {
        mongoClient.connect();
    }
    
    ~xmmServerDriver() {
        mongoClient.close();
    };
    
    XmmOperationE trainModels(std::string db, std::string srcColl, std::string dstColl,
                     std::vector<std::string> labels, std::vector<std::string> colnames) {
        
        std::vector<std::string> phrases = mongoClient.fetchPhrases(db, srcColl, labels, colnames);
        
        gmmTool.clearTrainingSet();
        
        // in case of no phrase match :
        if(phrases.size() > 0) {
            gmmTool.addToTrainingSet(phrases);
        } else {
            return XmmNoMatch;
        }
        
        gmmTool.setNbGaussians(3);
        gmmTool.train();
        
        std::string smodels = gmmTool.toString();
        mongoClient.writeModelsToDatabase(db, dstColl, smodels);
        
        return XmmOk;
    }
    
    void getModels() {
        // do this from node instead of here
    }
    
    
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
    
private:
    
    void newTrainingSet(std::vector<std::string> labels, std::vector<std::string> colnames) {
        
    }

    void print() {
        //multiThread only :
        /*
        mongoClient.work();
        mongoClient.wait();
        //*/
        
        std::vector<std::string> phrases = mongoClient.task(XmmMongoGet);
        //*
        // this does the work :
        gmmTool.clearTrainingSet();
        gmmTool.addToTrainingSet(phrases);
        gmmTool.train();
        
        std::string smodels = gmmTool.toString();
        mongoClient.writeModelsToDatabase(std::string("wimldb"), std::string("models"), smodels);
        
        /*
        Json::StyledWriter sw;
        smodels = sw.write(gmmTool.toJson());
        std::cout << smodels << std::endl;
        */
    }
    
};

//================== UTILITY ======================//

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
            if(args[0].size() > 3 && args[0][0].compare("train") == 0) {
                
                // parse labels and colnames :
                // TODO : write a function to optimize options / args parsing
                
                std::vector<std::string> labels, colnames;
                std::string db, src, dst, sender;
                db = args[0][1];
                src = args[0][2];
                dst = args[0][3];
                sender = std::string("");
                
                for(int i=0; i<args.size(); i++) {
                    if(args[i].size() > 0) {
                        std::string opt = args[i][0];
                        if(opt.compare("--sender") == 0 && args[i].size() > 1) {
                            sender = args[i][1];
                        }
                        else if(opt.compare("--labels") == 0) {
                            labels = std::vector<std::string>(args[i]);
                            labels.erase(labels.begin());
                        }
                        else if(opt.compare("--colnames") == 0) {
                            colnames = std::vector<std::string>(args[i]);
                            colnames.erase(colnames.begin());
                        }
                        else if(opt.compare("--gaussians") == 0) {
                            
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
                switch(driver.trainModels(db, src, dst, labels, colnames)) {
                    case XmmOk:
                        std::cout << "train ok --sender " << sender << std::endl;
                        break;
                        
                    case XmmNoMatch:
                        std::cout << "train nomatch --sender " << sender << std::endl;
                        break;
                        
                    default:
                        std::cout << "train unknownerror --sender " << sender << std::endl;
                        break;
                };
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
                //never happens, process supposed to be killed by host
                std::cout << driver.getLastPhrase() << std::endl;
            }
            //etc ...
            
            //std::cout << "received message " << input << " on stdin" << std::endl;
        }
    }

    std::cout << "Goodbye, World !\n";
    return EXIT_SUCCESS;
}
