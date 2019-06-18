package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【快速支付的用户的Omni充值地址】持久化对象 数据库表：t_fp_user_omni_address
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:56
 *
 */
public class FpUserOmniAddress extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // t_fp_user的id
    private Integer fpUserId;
    // 为用户创建的Omni充值地址
    private String omniAddress;
    // 创建时间
    private Date createTime;

    /** 获取 id 属性 */
    public Integer getId() {
        return id;
    }

    /** 设置 id 属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 t_fp_user的id 属性 */
    public Integer getFpUserId() {
        return fpUserId;
    }

    /** 设置 t_fp_user的id 属性 */
    public void setFpUserId(Integer fpUserId) {
        this.fpUserId = fpUserId;
    }

    /** 获取 为用户创建的Omni充值地址 属性 */
    public String getOmniAddress() {
        return omniAddress;
    }

    /** 设置 为用户创建的Omni充值地址 属性 */
    public void setOmniAddress(String omniAddress) {
        this.omniAddress = omniAddress;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("FpUserOmniAddress");
        sb.append("{id=").append(id);
        sb.append(", fpUserId=").append(fpUserId);
        sb.append(", omniAddress=").append(omniAddress);
        sb.append(", createTime=").append(createTime);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof FpUserOmniAddress) {
            FpUserOmniAddress fpUserOmniAddress = (FpUserOmniAddress) obj;
            if (this.getId().equals(fpUserOmniAddress.getId())) {
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
