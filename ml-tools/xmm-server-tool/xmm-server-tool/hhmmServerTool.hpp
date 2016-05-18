//
//  hhmmServerTool.hpp
//  xmm-server-tool
//
//  Created by Joseph Larralde on 14/04/16.
//  Copyright © 2016 IRCAM. All rights reserved.
//

#ifndef hhmmServerTool_hpp
#define hhmmServerTool_hpp

#include <cstdlib>
#include <iostream>

#include "xmmServerToolBase.h"

class hhmmServerTool : public xmmServerTool<xmm::HierarchicalHMM> {
    
public:
    hhmmServerTool() {};
    ~hhmmServerTool() {};
    
    void setNbStates(std::size_t nbStates);
};

#endif /* hhmmServerTool_hpp */
