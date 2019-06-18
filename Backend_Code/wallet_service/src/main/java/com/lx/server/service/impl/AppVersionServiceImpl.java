package com.lx.server.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lx.server.dao.MyBatisBaseDao;
import com.lx.server.service.impl.MybatisBaseServiceImpl;
import com.lx.server.dao.AppVersionDao;
import com.lx.server.service.AppVersionService;

/**
 * 【App版本号管理】 服务类 实现类
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-05-07 11:08:46
 *
 */
@Service(value = "appVersionService")
public class AppVersionServiceImpl extends MybatisBaseServiceImpl implements AppVersionService {

    @Autowired
    private AppVersionDao appVersionDao;

    @Override
    public MyBatisBaseDao getDao() {
        return appVersionDao;
    }

}
