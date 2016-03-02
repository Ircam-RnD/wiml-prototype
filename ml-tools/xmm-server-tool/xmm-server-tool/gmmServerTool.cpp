//
//  GMMServerTool.cpp
//  xmm-lib
//
//  Created by Joseph Larralde on 09/02/16.
//
//

#include "gmmServerTool.hpp"

void
gmmServerTool::addToTrainingSet(std::vector<std::string> phrases)
{
    xmm::Phrase xp;
    Json::Value jp;
    Json::Reader jr;
    for(std::size_t i=0; i<phrases.size(); i++) {
        
        if(jr.parse(phrases[i], jp)) {
            xp.fromJson(jp);
        } else {
            throw std::runtime_error("Cannot Parse Json String");
        }
        //xp.fromString(phrases[i]);
        set.addPhrase(static_cast<int>(set.size()), xp);
    }
    set.dimension.set(xp.dimension.get());
    set.column_names.set(xp.column_names, true);
    /*
    Json::Value jset = set.toJson();
    Json::StyledWriter w;
    std::cout << w.write(jset) << std::endl;
    //*/
}

void
gmmServerTool::clearTrainingSet()
{
    set.clear();
}

void
gmmServerTool::setNbGaussians(std::size_t n)
{
    gmm.configuration.gaussians.set(n, 1);
    gmm.configuration.changed = true;
    //std::cout << gmm.configuration.gaussians.get() << std::endl;
}

void
gmmServerTool::setRegularization(double rel, double abs)
{
    //TODO
}

void
gmmServerTool::train()
{
    gmm.train(&set);
}

Json::Value
gmmServerTool::toJson()
{
    return gmm.toJson();
}

std::string
gmmServerTool::toString()
{
    Json::Value jmodels = gmm.toJson();
    Json::FastWriter fw;
    return fw.write(jmodels);
}