package edu.wisc.union.websiteBackend.controllers.console;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/console")
public class ConsoleController {
    @GetMapping()
    public ResponseEntity getConsole(@RequestParam(required = false) String name) {
        if (name == null || name.isBlank())
            name = "World";
        return ResponseEntity.ok("Hello " + name);
    }
}
