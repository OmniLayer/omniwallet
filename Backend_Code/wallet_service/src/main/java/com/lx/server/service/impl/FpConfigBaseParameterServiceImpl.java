package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.FpConfigBaseParameterDao;
import com.lx.server.service.FpConfigBaseParameterService;

/**
 * 【平台基本配置参数】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:53
 *
 */
@Service(value = "fpConfigBaseParameterService")
public class FpConfigBaseParameterServiceImpl extends MybatisBaseServiceImpl implements FpConfigBaseParameterService {

    @Autowired
    private FpConfigBaseParameterDao fpConfigBaseParameterDao;

    @Override
    public MyBatisBaseDao getDao() {
        return fpConfigBaseParameterDao;
    }

}
