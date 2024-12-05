package edu.wisc.union.websiteBackend;

import edu.wisc.union.websiteBackend.auth.JwtUtil;
import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

import java.util.Collection;
import java.util.Collections;

@Configuration

@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)

public class SecurityConfig {
    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .cors(cors -> Customizer.withDefaults())

                .authorizeHttpRequests((authorize) ->
                        authorize
                                .dispatcherTypeMatchers(DispatcherType.FORWARD, DispatcherType.ERROR).permitAll()
                                .requestMatchers("/","/WudGamesWebsite.yaml","/swagger-ui/**","/v3/api-docs/**", "index", "/css/**", "/js/**","/webjars/**", "/error**")
                                .permitAll()
                                .anyRequest().permitAll())
                .oauth2ResourceServer((oauth2) -> oauth2.jwt(jwt -> jwt.decoder(jwtUtil.jwtDecoder()).jwtAuthenticationConverter(customJwtAuthenticationConverter())))
                .sessionManagement((session) -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .csrf(AbstractHttpConfigurer::disable)
//                .csrf(c -> c
//                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
//                )
                .headers(headers -> headers.referrerPolicy(referrerPolicy -> referrerPolicy.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN)))

        ;

        //.oauth2ResourceServer(oauth2 -> oauth2.jwt());
//                .logout((logout) -> logout.logoutSuccessUrl("/")
//                        .logoutSuccessHandler(logoutSuccessHandler())
//                )

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter customJwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(this::getAuthoritiesFromToken);
        return converter;
    }

    public Collection<GrantedAuthority> getAuthoritiesFromToken(Jwt jwt) {
        String level = jwt.getClaim("level");
        // Map the 'level' claim to the corresponding role
        if ("HOST".equalsIgnoreCase(level)) {
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_HOST"));
        } else if ("ADMIN".equalsIgnoreCase(level)) {
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"));
        }

        // Default to no authorities if the level is not recognized
        return Collections.emptyList();
    }


}
