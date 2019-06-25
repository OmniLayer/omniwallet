package com.lx.server.admin.config;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.ModelAndView;

import com.alibaba.fastjson.JSON;
import com.lx.server.bean.ResultTO;


@Component // 需要带上此注解
public class SimpleHandlerExceptionResolver implements HandlerExceptionResolver {

    Logger logger = LoggerFactory.getLogger(SimpleHandlerExceptionResolver.class);

    @Override
    public ModelAndView resolveException(HttpServletRequest request, HttpServletResponse response, Object handler, Exception e) {
        logger.error("权限访问异常", e);
        try {
            response.setCharacterEncoding("UTF-8");
            response.setContentType("text/html;charset=utf-8");
            response.setHeader("Cache-Control", "no-cache, must-revalidate");

            if (handler != null && handler.equals(1)) {
                response.setStatus(HttpStatus.FORBIDDEN.value());
            }
            response.getWriter().write(JSON.toJSONString(ResultTO.newResult(HttpStatus.FORBIDDEN.value(), e.getMessage(), null)));
        } catch (IOException ex) {
            logger.error("权限访问异常", ex);
        }
        return new ModelAndView();
    }

}
