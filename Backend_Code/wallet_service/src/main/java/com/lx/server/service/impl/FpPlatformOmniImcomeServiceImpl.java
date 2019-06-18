package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.FpPlatformOmniImcomeDao;
import com.lx.server.service.FpPlatformOmniImcomeService;

/**
 * 【快速支付的平台公链的收入】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:55
 *
 */
@Service(value = "fpPlatformOmniImcomeService")
public class FpPlatformOmniImcomeServiceImpl extends MybatisBaseServiceImpl implements FpPlatformOmniImcomeService {

    @Autowired
    private FpPlatformOmniImcomeDao fpPlatformOmniImcomeDao;

    @Override
    public MyBatisBaseDao getDao() {
        return fpPlatformOmniImcomeDao;
    }

}
