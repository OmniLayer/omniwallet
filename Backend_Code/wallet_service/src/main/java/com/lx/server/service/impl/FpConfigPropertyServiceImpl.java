package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.FpConfigPropertyDao;
import com.lx.server.service.FpConfigPropertyService;

/**
 * 【平台支持的资产类型】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:55
 *
 */
@Service(value = "fpConfigPropertyService")
public class FpConfigPropertyServiceImpl extends MybatisBaseServiceImpl implements FpConfigPropertyService {

    @Autowired
    private FpConfigPropertyDao fpConfigPropertyDao;

    @Override
    public MyBatisBaseDao getDao() {
        return fpConfigPropertyDao;
    }

}
