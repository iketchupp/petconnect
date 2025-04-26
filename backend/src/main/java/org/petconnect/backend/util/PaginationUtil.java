package org.petconnect.backend.util;

import java.util.List;

public class PaginationUtil {

    private PaginationUtil() {
    }

    public static int processLimit(Integer limit) {
        // If limit is null or negative, use default of 12
        if (limit == null || limit < 0) {
            return 12;
        }

        // If limit is 0, return all data by using Integer.MAX_VALUE
        if (limit == 0) {
            return Integer.MAX_VALUE;
        }

        // Otherwise, use the provided limit
        return limit;
    }

    public static int getQueryLimit(int limit) {
        if (limit == Integer.MAX_VALUE) {
            return limit; // Don't add one when returning all
        }
        return limit + 1; // Request one extra to determine if there are more
    }

    public static <T> PaginationResult<T> processResults(List<T> results, int limit) {
        // If we're returning all data (limit is MAX_VALUE), there's never more data
        if (limit == Integer.MAX_VALUE) {
            return new PaginationResult<>(results, false);
        }

        // Check if we have more results
        boolean hasMore = results.size() > limit;

        // Remove the extra item if we have more
        if (hasMore) {
            results = results.subList(0, limit);
        }

        return new PaginationResult<>(results, hasMore);
    }

    public static class PaginationResult<T> {
        private final List<T> results;
        private final boolean hasMore;

        public PaginationResult(List<T> results, boolean hasMore) {
            this.results = results;
            this.hasMore = hasMore;
        }

        public List<T> getResults() {
            return results;
        }

        public boolean hasMore() {
            return hasMore;
        }
    }
}