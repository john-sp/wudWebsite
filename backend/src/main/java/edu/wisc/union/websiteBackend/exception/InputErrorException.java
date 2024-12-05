package edu.wisc.union.websiteBackend.exception;
import lombok.Getter;

@Getter
public class InputErrorException extends RuntimeException {

    private String errorCode;
    private String errorMessage;

    public InputErrorException(String errorCode, String errorMessage) {
        super("{"+errorCode+"} "+errorMessage);
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }
}
