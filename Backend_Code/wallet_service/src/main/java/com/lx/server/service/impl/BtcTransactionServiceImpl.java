package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.BtcTransactionDao;
import com.lx.server.service.BtcTransactionService;

/**
 * 【btc的交易记录】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-30 15:39:57
 *
 */
@Service(value = "btcTransactionService")
public class BtcTransactionServiceImpl extends MybatisBaseServiceImpl implements BtcTransactionService {

    @Autowired
    private BtcTransactionDao btcTransactionDao;

    @Override
    public MyBatisBaseDao getDao() {
        return btcTransactionDao;
    }

}
