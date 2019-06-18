package com.lx.server.enums;

import org.springframework.util.StringUtils;

/**
 * 数据库表名
 * @author ZhuGuojun
 *
 */
public enum EnumServerUrlHyperledger {
	/**
	 * 初始化Token
	 */
	initToken("initToken"),
	/**
	 * 创建普通账户
	 */
	createAccount("createAccount"),
	/**
	 * 普通账户信息
	 */
	accountInfo("accountInfo"),
	/**
	 * BASE账户信息
	 */
	baseAccount("baseAccount"),
	/**
	 * 普通账户余额
	 */
	balances("balances"),
	/**
	 * 转账
	 */
	transferToken("transferToken"),
	/**
	 * 铸币（Token）
	 */
	mintToken("mintToken"),
	/**
	 * 烧币
	 */
	burnToken("burnToken"),
	/**
	 * 锁仓
	 */
	lock("lock"),
	/**
	 * 冻结账户
	 */
	frozenAccount("frozenAccount"),
	;
	
	public final String value;
	
	EnumServerUrlHyperledger(String value) {
		this.value = value;
	}
	
	public String getValue() {
		return this.value;
	}
	public static EnumServerUrlHyperledger getValue(String tableName) {
		if (StringUtils.isEmpty(tableName)==true) {
			return null;
		}
		for (EnumServerUrlHyperledger examType : EnumServerUrlHyperledger.values()) {
            if (examType.value.equals(tableName)) {
                return examType;
            }
        }
        return null;
	}
}
