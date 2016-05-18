//
//  hhmmServerTool.cpp
//  xmm-server-tool
//
//  Created by Joseph Larralde on 14/04/16.
//  Copyright © 2016 IRCAM. All rights reserved.
//

#include "hhmmServerTool.hpp"

void
hhmmServerTool::setNbStates(std::size_t nbStates) {
    if(nbStates > 0) {
        model.configuration.states.set(nbStates, 1);
        model.configuration.changed = true;
    }
    //std::cout << model.configuration.states.get() << std::endl;
}