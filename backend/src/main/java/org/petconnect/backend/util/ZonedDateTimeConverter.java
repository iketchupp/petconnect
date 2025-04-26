package org.petconnect.backend.util;

import java.sql.Timestamp;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ZonedDateTimeConverter implements AttributeConverter<ZonedDateTime, Timestamp> {

    private static final ZoneId UTC = ZoneId.of("UTC");

    @Override
    public Timestamp convertToDatabaseColumn(ZonedDateTime attribute) {
        if (attribute == null) {
            return null;
        }

        // Make sure the ZonedDateTime is in UTC before converting to timestamp
        ZonedDateTime utcDateTime = attribute.getZone().equals(UTC)
                ? attribute
                : attribute.withZoneSameInstant(UTC);

        return Timestamp.valueOf(utcDateTime.toLocalDateTime());
    }

    @Override
    public ZonedDateTime convertToEntityAttribute(Timestamp dbData) {
        if (dbData == null) {
            return null;
        }

        // Convert the Timestamp to a ZonedDateTime in UTC
        return dbData.toLocalDateTime().atZone(UTC);
    }
}