package com.lx.server.config;


public class GlobalConfig {

    /**
	 * 项目名称
	 */
	public static String name;
	/**
	 * 密码加密用的密钥
	 */
	public static String secret;
	/**
	 * token生命周期
	 */
	public static long expiration;
    /** 返回状态--成功 */
    public static final int STATUS_SUCCESS = 1;
    /** 返回状态--失败 */
    public static final int STATUS_FAILURE = 0;
    /**媒体服务器的上传地址*/
    public static String BASE_IMAGE_ADDRESS = "";

}
