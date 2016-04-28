//
//  hhmmServerTool.cpp
//  xmm-server-tool
//
//  Created by Joseph Larralde on 14/04/16.
//  Copyright © 2016 IRCAM. All rights reserved.
//

#include "hhmmServerTool.hpp"

void
hhmmServerTool::setNbStates(unsigned int nbStates) {
    if(nbStates > 0) {
        model.configuration.states = nbStates;
        model.configuration.changed = true;
    }
}