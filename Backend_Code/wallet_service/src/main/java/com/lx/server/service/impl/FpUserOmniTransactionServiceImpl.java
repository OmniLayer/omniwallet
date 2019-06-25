package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.FpUserOmniTransactionDao;
import com.lx.server.service.FpUserOmniTransactionService;

/**
 * 【快速支付的用户的交易记录】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:57
 *
 */
@Service(value = "fpUserOmniTransactionService")
public class FpUserOmniTransactionServiceImpl extends MybatisBaseServiceImpl implements FpUserOmniTransactionService {

    @Autowired
    private FpUserOmniTransactionDao fpUserOmniTransactionDao;

    @Override
    public MyBatisBaseDao getDao() {
        return fpUserOmniTransactionDao;
    }

}
