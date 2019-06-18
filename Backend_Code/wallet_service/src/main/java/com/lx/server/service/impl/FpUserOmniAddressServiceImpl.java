package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.FpUserOmniAddressDao;
import com.lx.server.service.FpUserOmniAddressService;

/**
 * 【快速支付的用户的Omni充值地址】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:56
 *
 */
@Service(value = "fpUserOmniAddressService")
public class FpUserOmniAddressServiceImpl extends MybatisBaseServiceImpl implements FpUserOmniAddressService {

    @Autowired
    private FpUserOmniAddressDao fpUserOmniAddressDao;

    @Override
    public MyBatisBaseDao getDao() {
        return fpUserOmniAddressDao;
    }

}
