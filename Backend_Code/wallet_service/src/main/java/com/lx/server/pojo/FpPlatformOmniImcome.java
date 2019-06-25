package com.lx.server.pojo;

import java.math.BigDecimal;
import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【快速支付的平台公链的收入】持久化对象 数据库表：t_fp_platform_omni_imcome
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:55
 *
 */
public class FpPlatformOmniImcome extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // omni的资产id btc为0 usdt为31 lx为361
    private Long propertyId;
    // 源头地址
    private String fromAddress;
    // 平台地址
    private String platformAddress;
    // 交易数量
    private BigDecimal amount;
    // 公链的交易id
    private String txid;
    // 矿工确认数量
    private Integer confirmations;
    // 创建时间
    private Date createTime;
    // 是否完成了铸币
    private Boolean isMinted;
    // 铸币时间
    private Date mintTime;
    // hyper的交易id
    private String mintTxid;

    /** 获取 id 属性 */
    public Integer getId() {
        return id;
    }

    /** 设置 id 属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 omni的资产id btc为0 usdt为31 lx为361 属性 */
    public Long getPropertyId() {
        return propertyId;
    }

    /** 设置 omni的资产id btc为0 usdt为31 lx为361 属性 */
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    /** 获取 源头地址 属性 */
    public String getFromAddress() {
        return fromAddress;
    }

    /** 设置 源头地址 属性 */
    public void setFromAddress(String fromAddress) {
        this.fromAddress = fromAddress;
    }

    /** 获取 平台地址 属性 */
    public String getPlatformAddress() {
        return platformAddress;
    }

    /** 设置 平台地址 属性 */
    public void setPlatformAddress(String platformAddress) {
        this.platformAddress = platformAddress;
    }

    /** 获取 交易数量 属性 */
    public BigDecimal getAmount() {
        return amount;
    }

    /** 设置 交易数量 属性 */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /** 获取 公链的交易id 属性 */
    public String getTxid() {
        return txid;
    }

    /** 设置 公链的交易id 属性 */
    public void setTxid(String txid) {
        this.txid = txid;
    }

    /** 获取 矿工确认数量 属性 */
    public Integer getConfirmations() {
        return confirmations;
    }

    /** 设置 矿工确认数量 属性 */
    public void setConfirmations(Integer confirmations) {
        this.confirmations = confirmations;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取 是否完成了铸币 属性 */
    public Boolean getIsMinted() {
        return isMinted;
    }

    /** 设置 是否完成了铸币 属性 */
    public void setIsMinted(Boolean isMinted) {
        this.isMinted = isMinted;
    }

    /** 获取 铸币时间 属性 */
    public Date getMintTime() {
        return mintTime;
    }

    /** 设置 铸币时间 属性 */
    public void setMintTime(Date mintTime) {
        this.mintTime = mintTime;
    }

    /** 获取 hyper的交易id 属性 */
    public String getMintTxid() {
        return mintTxid;
    }

    /** 设置 hyper的交易id 属性 */
    public void setMintTxid(String mintTxid) {
        this.mintTxid = mintTxid;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("FpPlatformOmniImcome");
        sb.append("{id=").append(id);
        sb.append(", propertyId=").append(propertyId);
        sb.append(", fromAddress=").append(fromAddress);
        sb.append(", platformAddress=").append(platformAddress);
        sb.append(", amount=").append(amount);
        sb.append(", txid=").append(txid);
        sb.append(", confirmations=").append(confirmations);
        sb.append(", createTime=").append(createTime);
        sb.append(", isMinted=").append(isMinted);
        sb.append(", mintTime=").append(mintTime);
        sb.append(", mintTxid=").append(mintTxid);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof FpPlatformOmniImcome) {
            FpPlatformOmniImcome fpPlatformOmniImcome = (FpPlatformOmniImcome) obj;
            if (this.getId().equals(fpPlatformOmniImcome.getId())) {
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
