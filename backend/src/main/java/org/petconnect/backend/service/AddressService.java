package org.petconnect.backend.service;

import java.util.List;

import org.petconnect.backend.repository.AddressRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public List<String> getCitiesByCountry(String country) {
        return addressRepository.findDistinctCitiesByCountry(country);
    }

    public List<String> getAllCountries() {
        return addressRepository.findDistinctCountries();
    }
}