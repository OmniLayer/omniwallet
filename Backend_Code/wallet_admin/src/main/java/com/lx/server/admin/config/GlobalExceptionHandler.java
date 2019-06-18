package com.lx.server.admin.config;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.lx.server.bean.ResultTO;



/**
 * 全局异常处理
 */
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    protected final Log logger = LogFactory.getLog(getClass());

    /**
     * 在controller里面内容执行之前，校验一些参数不匹配啊，Get post方法不对啊之类的
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
    protected ResponseEntity handleExceptionInternal(Exception ex, Object body, HttpHeaders headers, HttpStatus status, WebRequest request) {
        logger.error("接口访问方式错误", ex);
        if (ex.getClass().getName().equalsIgnoreCase("org.springframework.web.bind.MethodArgumentNotValidException")) {
            return ResponseEntity.ok(ResultTO.newFailResult(ex.getMessage(), null));
        }
        return ResponseEntity.ok(ResultTO.newFailResult("接口访问错误，数据类型出问题了", ex.getMessage()));
    }

    @SuppressWarnings("rawtypes")
	@ExceptionHandler(value = Exception.class)
    @ResponseBody
    public ResponseEntity jsonHandler(HttpServletRequest request, Exception e) {
    	logger.error("参数出错");
        log(e, request);
        return ResponseEntity.ok(ResultTO.newFailResult(e.getMessage(), null));
    }

    private void log(Exception ex, HttpServletRequest request) {
        logger.error("************************异常开始*******************************");
        logger.error("请求地址：" + request.getRequestURL());
        logger.error("错误信息", ex);
        logger.error("************************异常结束*******************************");
    }
}