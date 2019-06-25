package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.BtcTransactionUpdateLogDao;
import com.lx.server.service.BtcTransactionUpdateLogService;

/**
 * 【btc交易记录更新日志】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-05-10 10:08:45
 *
 */
@Service(value = "btcTransactionUpdateLogService")
public class BtcTransactionUpdateLogServiceImpl extends MybatisBaseServiceImpl implements BtcTransactionUpdateLogService {

    @Autowired
    private BtcTransactionUpdateLogDao btcTransactionUpdateLogDao;

    @Override
    public MyBatisBaseDao getDao() {
        return btcTransactionUpdateLogDao;
    }

}
