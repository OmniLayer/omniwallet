package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.WalletAddressDao;
import com.lx.server.service.WalletAddressService;

/**
 * 【用户钱包地址】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-13 23:59:47
 *
 */
@Service(value = "walletAddressService")
public class WalletAddressServiceImpl extends MybatisBaseServiceImpl implements WalletAddressService {

    @Autowired
    private WalletAddressDao walletAddressDao;

    @Override
    public MyBatisBaseDao getDao() {
        return walletAddressDao;
    }

}
