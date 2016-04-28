//
//  genericXmmServerTool.h
//  xmm-server-tool
//
//  Created by Joseph Larralde on 14/04/16.
//  Copyright © 2016 IRCAM. All rights reserved.
//

#ifndef xmmServerToolBase_h
#define xmmServerToolBase_h

#include "xmm.h"

// our common interface class for polymorphism :

class xmmServerToolBase {
public:
    virtual void addToTrainingSet(std::vector<std::string> phrases) = 0;
    virtual void clearTrainingSet() = 0;
    virtual void train() = 0;
    virtual Json::Value toJson() = 0;
    virtual std::string toString() = 0;
    virtual void setNbGaussians(std::size_t n) = 0;
    virtual void setRelativeRegularization(double relReg) = 0;
    virtual void setAbsoluteRegularization(double absReg) = 0;
};

// the specializable template :

template<typename Model>
class xmmServerTool : public xmmServerToolBase {

public:
    xmm::TrainingSet set;
    Model model;

    xmmServerTool() {}
    ~xmmServerTool() {}
    
    virtual void addToTrainingSet(std::vector<std::string> phrases) {
        xmm::Phrase xp;
        Json::Value jp;
        Json::Reader jr;
        for(std::size_t i=0; i<phrases.size(); i++) {
            
            //std::cout << phrases[i] << std::endl;
            if(jr.parse(phrases[i], jp)) {
                xp.fromJson(jp);
            } else {
                throw std::runtime_error("Cannot Parse Json String");
            }
            //xp.fromString(phrases[i]);
            set.addPhrase(static_cast<int>(set.size()), xp);
        }
        set.dimension.set(xp.dimension.get());
        //std::cout << xp.column_names[0] << std::endl;
        set.column_names.set(xp.column_names, true);
        /*
         Json::Value jset = set.toJson();
         Json::StyledWriter w;
         std::cout << w.write(jset) << std::endl;
         //*/        
    }
    
    virtual void clearTrainingSet() {
        set.clear();
    }
    
    virtual void train() {
        model.train(&set);
    }
    
    virtual Json::Value toJson() {
        return model.toJson();        
    }
    
    virtual std::string toString() {
        Json::Value jmodels = model.toJson();
        Json::FastWriter fw;
        return fw.write(jmodels);
    }
    
    // configuration
    
    virtual void setNbGaussians(std::size_t n) {
        if(n > 0) {
            model.configuration.gaussians.set(n, 1);
            model.configuration.changed = true;
        }
        //std::cout << gmm.configuration.gaussians.get() << std::endl;
    }
    
    virtual void setRelativeRegularization(double relReg) {
        if(relReg > 0) {
            model.configuration.relative_regularization.set(relReg);
            model.configuration.changed = true;
        }
    }

    virtual void setAbsoluteRegularization(double absReg) {
        if(absReg > 0) {
            model.configuration.absolute_regularization.set(absReg);
            model.configuration.changed = true;
        }
    }
};


#endif /* xmmServerToolBase_h */
