package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.UserTransferAddressDao;
import com.lx.server.service.UserTransferAddressService;

/**
 * 【用户的转账常用地址】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-22 09:12:07
 *
 */
@Service(value = "userTransferAddressService")
public class UserTransferAddressServiceImpl extends MybatisBaseServiceImpl implements UserTransferAddressService {

    @Autowired
    private UserTransferAddressDao userTransferAddressDao;

    @Override
    public MyBatisBaseDao getDao() {
        return userTransferAddressDao;
    }

}
