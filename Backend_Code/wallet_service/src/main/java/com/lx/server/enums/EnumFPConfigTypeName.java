package com.lx.server.enums;

/**
 * 快速支付的配置参数的名称
 * @author ZhuGuojun
 *
 */
public enum EnumFPConfigTypeName {

	Error("error"),
	initOmniAmount("initOmniAmount"),
	;
	
	public String value;
	
	EnumFPConfigTypeName(String value) {
		this.value = value;
	}
	
	public String getValue() {
		return this.value;
	}
	public static EnumFPConfigTypeName getValue(String name) {
		for (EnumFPConfigTypeName examType : EnumFPConfigTypeName.values()) {
            if (examType.value.equals(name)) {
                return examType;
            }
        }
        return Error;
	}
}
