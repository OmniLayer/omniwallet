package com.lx.server.enums;

import org.springframework.util.StringUtils;

/**
 * 数据库表名
 *t_user_admin, t_user_client, t_user_feedback, t_user_login_log, t_wallet_address, t_wallet_asset
 */
public enum EnumDBTableName {
	
	t_default_type_table("t_default_type_table"),
	t_user_admin("t_user_admin"),
	t_user_client("t_user_client"),
	t_wallet_address("t_wallet_address"),
	t_wallet_asset("t_wallet_asset"),
	t_user_login_log("t_user_login_log"),
	t_user_feedback("t_user_feedback"),
	;
	
	public final String value;
	
	EnumDBTableName(String value) {
		this.value = value;
	}
	
	public String getValue() {
		return this.value;
	}
	public static EnumDBTableName getValue(String tableName) {
		if (StringUtils.isEmpty(tableName)==true) {
			return null;
		}
		for (EnumDBTableName examType : EnumDBTableName.values()) {
            if (examType.value.equals(tableName)) {
                return examType;
            }
        }
        return null;
	}
}
