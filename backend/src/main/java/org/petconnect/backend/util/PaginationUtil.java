package org.petconnect.backend.util;

import java.util.List;

/**
 * Utility class for pagination-related operations
 */
public class PaginationUtil {

    private PaginationUtil() {
        // Private constructor to prevent instantiation
    }

    /**
     * Processes the limit parameter. If limit is 0, returns Integer.MAX_VALUE
     * to effectively return all data. Otherwise, returns the original limit value.
     *
     * @param limit The original limit value
     * @return The processed limit value
     */
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

    /**
     * Handles the "get one more for pagination" pattern when limit is
     * Integer.MAX_VALUE.
     * When we're returning all data, we don't need to get one more and will never
     * have a next page.
     *
     * @param limit The processed limit value
     * @return The limit to use for the query (limit+1 for normal pagination, same
     *         as limit for "all data")
     */
    public static int getQueryLimit(int limit) {
        if (limit == Integer.MAX_VALUE) {
            return limit; // Don't add one when returning all
        }
        return limit + 1; // Request one extra to determine if there are more
    }

    /**
     * Processes the results based on the query limit and actual limit
     *
     * @param <T>     The type of items in the list
     * @param results The results from the query
     * @param limit   The original limit value
     * @return An object containing the processed list and whether there are more
     *         results
     */
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

    /**
     * Container class for pagination result
     */
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