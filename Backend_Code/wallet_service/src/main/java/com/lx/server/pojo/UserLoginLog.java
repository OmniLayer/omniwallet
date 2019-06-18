package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【用户登录日志】持久化对象 数据库表：t_user_login_log
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-13 23:59:46
 *
 */
public class UserLoginLog extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // 对应类型的表名（前端用户，后台管理用户）
    private String typeTable;
    // 对应的数据id
    private String typeId;
    // 登录时间
    private Date loginTime;
    // 登录终端类型 0 移动端，1web端
    private Integer loginEndType;
    // 登录的ip
    private String loginIp;

    /** 获取 id 属性 */
    public Integer getId() {
        return id;
    }

    /** 设置 id 属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 对应类型的表名（前端用户，后台管理用户） 属性 */
    public String getTypeTable() {
        return typeTable;
    }

    /** 设置 对应类型的表名（前端用户，后台管理用户） 属性 */
    public void setTypeTable(String typeTable) {
        this.typeTable = typeTable;
    }

    /** 获取 对应的数据id 属性 */
    public String getTypeId() {
        return typeId;
    }

    /** 设置 对应的数据id 属性 */
    public void setTypeId(String typeId) {
        this.typeId = typeId;
    }

    /** 获取 登录时间 属性 */
    public Date getLoginTime() {
        return loginTime;
    }

    /** 设置 登录时间 属性 */
    public void setLoginTime(Date loginTime) {
        this.loginTime = loginTime;
    }

    /** 获取 登录终端类型 0 移动端，1web端 属性 */
    public Integer getLoginEndType() {
        return loginEndType;
    }

    /** 设置 登录终端类型 0 移动端，1web端 属性 */
    public void setLoginEndType(Integer loginEndType) {
        this.loginEndType = loginEndType;
    }

    /** 获取 登录的ip 属性 */
    public String getLoginIp() {
        return loginIp;
    }

    /** 设置 登录的ip 属性 */
    public void setLoginIp(String loginIp) {
        this.loginIp = loginIp;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("UserLoginLog");
        sb.append("{id=").append(id);
        sb.append(", typeTable=").append(typeTable);
        sb.append(", typeId=").append(typeId);
        sb.append(", loginTime=").append(loginTime);
        sb.append(", loginEndType=").append(loginEndType);
        sb.append(", loginIp=").append(loginIp);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof UserLoginLog) {
            UserLoginLog userLoginLog = (UserLoginLog) obj;
            if (this.getId().equals(userLoginLog.getId())) {
                return true;
            }
        }
        return false;
    }

    public int hashCode() {
        String pkStr = "" + this.getId();
        return pkStr.hashCode();
    }

}
