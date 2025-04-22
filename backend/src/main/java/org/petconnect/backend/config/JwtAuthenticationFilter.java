package org.petconnect.backend.config;

import java.io.IOException;
import java.time.LocalDateTime;

import org.petconnect.backend.dto.error.ErrorResponse;
import org.petconnect.backend.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return SecurityPaths.PUBLIC_ENDPOINTS.stream()
                .anyMatch(endpoint -> {
                    boolean pathMatches = pathMatcher.match(endpoint.path(), request.getServletPath());
                    boolean methodMatches = endpoint.method() == null ||
                            endpoint.method().toString().equals(request.getMethod());
                    return pathMatches && methodMatches;
                });
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Try to get token from cookies
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (cookie.getName().equals(jwtService.getCookieName())) {
                        jwt = cookie.getValue();
                        try {
                            userEmail = jwtService.extractUsername(jwt);
                            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                                if (jwtService.isTokenValid(jwt, userDetails)) {
                                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities());
                                    authToken.setDetails(
                                            new WebAuthenticationDetailsSource().buildDetails(request));
                                    SecurityContextHolder.getContext().setAuthentication(authToken);
                                }
                            }
                        } catch (ExpiredJwtException e) {
                            handleError(response, HttpStatus.UNAUTHORIZED, "JWT token has expired", "Unauthorized");
                        } catch (JwtException e) {
                            handleError(response, HttpStatus.UNAUTHORIZED, "Invalid JWT token", "Unauthorized");
                        }
                        filterChain.doFilter(request, response);
                        return;
                    }
                }
            }
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            handleError(response, HttpStatus.UNAUTHORIZED, "JWT token has expired", "Unauthorized");
        } catch (JwtException e) {
            handleError(response, HttpStatus.UNAUTHORIZED, "Invalid JWT token", "Unauthorized");
        }
    }

    private void handleError(HttpServletResponse response, HttpStatus status, String message, String error)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(error)
                .message(message)
                .path("/api/v1")
                .build();

        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}