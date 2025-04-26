package org.petconnect.backend.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {

    private static final ZoneId UTC = ZoneId.of("UTC");
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    public static ZonedDateTime toUTC(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return localDateTime.atZone(ZoneId.systemDefault()).withZoneSameInstant(UTC);
    }

    public static LocalDateTime fromUTC(ZonedDateTime utcDateTime) {
        if (utcDateTime == null) {
            return null;
        }
        return utcDateTime.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
    }

    public static ZonedDateTime nowUTC() {
        return ZonedDateTime.now(UTC);
    }

    public static String formatISO(ZonedDateTime zonedDateTime) {
        if (zonedDateTime == null) {
            return null;
        }
        return zonedDateTime.format(ISO_FORMATTER);
    }
}