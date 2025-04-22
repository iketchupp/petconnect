package org.petconnect.backend.repository;

import java.util.List;
import java.util.UUID;

import org.petconnect.backend.model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {

    @Query("SELECT DISTINCT a.city FROM Address a WHERE LOWER(a.country) = LOWER(:country) ORDER BY a.city")
    List<String> findDistinctCitiesByCountry(@Param("country") String country);

    @Query("SELECT DISTINCT a.country FROM Address a ORDER BY a.country")
    List<String> findDistinctCountries();
}