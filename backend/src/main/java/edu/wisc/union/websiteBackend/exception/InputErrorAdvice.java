package edu.wisc.union.websiteBackend.exception;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Collections;

@Log4j2
@ControllerAdvice
public class InputErrorAdvice {

    @ResponseBody
    @ExceptionHandler(InputErrorException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    String inputErrorHandler(HttpServletRequest request, InputErrorException ex)
    {
        MDC.put("errorCode", ex.getErrorCode());
        log.error(ex.getErrorMessage());
        request.setAttribute(HandlerMapping.PRODUCIBLE_MEDIA_TYPES_ATTRIBUTE, Collections.singleton(MediaType.APPLICATION_JSON));
        return "{ \"errorCode\" : \"" + ex.getErrorCode() + "\", \"errorMessage\": \""+ex.getErrorMessage() + "\"}";
    }
}
