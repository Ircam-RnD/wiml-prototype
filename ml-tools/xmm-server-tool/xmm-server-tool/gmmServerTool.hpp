//
//  GMMServerTool.hpp
//  xmm-lib
//
//  Created by Joseph Larralde on 09/02/16.
//
//

#ifndef gmmServerTool_hpp
#define gmmServerTool_hpp

#include <cstdlib>
#include <iostream>

#include "xmm.h"

class gmmServerTool {

    xmm::TrainingSet set;
    //xmm::Phrase phrase;
    xmm::GMM gmm;
    
public:
    gmmServerTool() {};
    ~gmmServerTool() {};
    
    //void buildTrainingSet(std::vector<std::string> labels);
    void addToTrainingSet(std::vector<std::string> phrases);
    void clearTrainingSet();
    
    void setNbGaussians(std::size_t n);
    void setRegularization(double rel, double abs);
    
    void train();
    
    Json::Value toJson();
    std::string toString();
    //std::vector<double> getLikelihoods(std::vector<double> chunk);
    
};

#endif /* gmmServerTool_hpp */
