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

#include "xmmServerToolBase.h"

class gmmServerTool : public xmmServerTool<xmm::GMM> {
    
public:
    gmmServerTool() {};
    ~gmmServerTool() {};
};

#endif /* gmmServerTool_hpp */
