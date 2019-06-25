package com.lx.server.dao;

import java.util.List;
import java.util.Map;

public interface MyBatisBaseDao {
    <P> int insert(P paramP);

    <P> int update(P paramP);

    <P> int delete(P paramP);

    <T, P> T selectObject(P paramP);

    <T, P> List<T> selectObjectList(P paramP);

    <K, V, P> Map<K, V> selectMap(P paramP);

    <K, V, P> List<Map<K, V>> selectMapList(P paramP);

    <T, P> List<T> page(P paramP);

    <T, P> List<T> pageBean(P paramP);

    <P> int pageCount(P paramP);
}
