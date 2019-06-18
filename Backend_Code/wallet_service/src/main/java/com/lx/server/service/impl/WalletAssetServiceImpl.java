package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.WalletAssetDao;
import com.lx.server.service.WalletAssetService;

/**
 * 【用户钱包地址的资产】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-13 23:59:48
 *
 */
@Service(value = "walletAssetService")
public class WalletAssetServiceImpl extends MybatisBaseServiceImpl implements WalletAssetService {

    @Autowired
    private WalletAssetDao walletAssetDao;

    @Override
    public MyBatisBaseDao getDao() {
        return walletAssetDao;
    }

}
