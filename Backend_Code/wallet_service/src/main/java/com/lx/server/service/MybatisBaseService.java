package com.lx.server.service;


import java.util.List;
import java.util.Map;

import com.lx.server.bean.Page;
import com.lx.server.dao.MyBatisBaseDao;


public interface MybatisBaseService {
    <P> int insert(P paramP);

    <P> int update(P paramP);

    <P> int delete(P paramP);

    <T, P> T selectObject(P paramP);

    <T, P> List<T> selectObjectList(P paramP);

    <V, P> Map<String, V> selectMap(P paramP);

    <V, P> List<Map<String, V>> selectMapList(P paramP);

    Page page(Map<String, Object> param, int pageIndex, int pageSize);

    int pageCount(Map<String, Object> param);


    Page page(String paramString1, String paramString2, Map<String, Object> paramMap,
              int paramInt1, int paramInt2);

    <P> void asyncInsert(P paramP);

    <P> void asyncUpdate(P paramP);

    <P> void asyncDelete(P paramP);

    MyBatisBaseDao getDao();
}
