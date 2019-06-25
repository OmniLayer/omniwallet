package com.lx.server.enums;

public enum EnumVersionPlatform {
    
	error((byte)-1),
	ios((byte)0),
    android((byte)1);
	
	
    private byte value;
    EnumVersionPlatform(Byte value) {
        this.value = value;
    }

    public static EnumVersionPlatform getEnum(Byte value) {
        for (EnumVersionPlatform examType : EnumVersionPlatform.values()) {
            if (value == examType.value) {
                return examType;
            }
        }
        return error;
    }
    public String getName(){
        return this.name();
    }
    public byte getValue() {
        return value;
    }
}
