import React, { useEffect, useState, useCallback } from "react";
import "../static/styles/input.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  clearInputError,
  setInputError,
  updateInput,
} from "../store/inputSlice";
import { debounce } from "lodash";
import { RootState } from "../store/store";

interface CitySuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface InputProps {
  istime?: boolean;
  isdate?: boolean;
  iscity?: boolean;
  placeholder: string;
  inputKey: string;
}

export const Input: React.FC<InputProps> = ({
  istime,
  isdate,
  iscity,
  placeholder,
  inputKey,
}) => {
  const dispatch = useDispatch();
  const valueFromStore = useSelector(
    (state: RootState) => state.inputs.values[inputKey] || ""
  );
  const errorMessage = useSelector(
    (state: RootState) => state.inputs.errors[inputKey]
  );
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchCities = useCallback(
    debounce((value: string) => {
      if (value.trim() === "") {
        setCitySuggestions([]);
        setIsLoading(false);
        return;
      }

      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          value
        )}&countrycodes=ru&addressdetails=1&limit=10&format=json`
      )
        .then((response) => response.json())
        .then((data: CitySuggestion[]) => {
          setCitySuggestions(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Ошибка при получении данных о городе:", error);
          setIsLoading(false);
        });
    }, 1000),
    []
  );

  useEffect(() => {
    return () => {
      fetchCities.cancel();
    };
  }, [fetchCities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (isdate) {
      // Удаляем все символы, кроме цифр и точек
      value = value.replace(/[^\d\.]/g, "");

      // Ограничиваем общую длину до 10 символов
      if (value.length > 10) {
        value = value.slice(0, 10);
      }

      // Автоматически вставляем точки
      if (value.length > 2 && value[2] !== ".") {
        value = value.slice(0, 2) + "." + value.slice(2);
      }
      if (value.length > 5 && value[5] !== ".") {
        value = value.slice(0, 5) + "." + value.slice(5);
      }

      dispatch(updateInput({ key: inputKey, value }));

      // Валидация после обновления состояния
      const [dayStr, monthStr, yearStr] = value.split(".");

      let day = parseInt(dayStr, 10);
      let month = parseInt(monthStr, 10);
      let year = parseInt(yearStr, 10);

      const currentYear = new Date().getFullYear();

      let error = "";

      if (dayStr && (isNaN(day) || day < 1 || day > 31)) {
        error = "День должен быть от 1 до 31";
      }

      if (!error && monthStr && (isNaN(month) || month < 1 || month > 12)) {
        error = "Месяц должен быть от 1 до 12";
      }

      if (
        !error &&
        yearStr &&
        (isNaN(year) || year < 1900 || year > currentYear)
      ) {
        error = `Год должен быть от 1900 до ${currentYear}`;
      }

      if (!error && dayStr && monthStr && yearStr) {
        const date = new Date(year, month - 1, day);
        if (
          date.getFullYear() !== year ||
          date.getMonth() !== month - 1 ||
          date.getDate() !== day
        ) {
          error = "Введена некорректная дата";
        }
      }

      setError(error);
      if (error) {
        dispatch(setInputError({ key: inputKey, error }));
      } else {
        dispatch(clearInputError({ key: inputKey }));
      }
    } else if (istime) {
      // Удаляем все символы, кроме цифр и двоеточий
      value = value.replace(/[^\d:]/g, "");

      // Ограничиваем общую длину до 8 символов (формат HH:MM:SS)
      if (value.length > 8) {
        value = value.slice(0, 8);
      }

      // Автоматически вставляем двоеточия
      if (value.length > 2 && value[2] !== ":") {
        value = value.slice(0, 2) + ":" + value.slice(2);
      }
      if (value.length > 5 && value[5] !== ":") {
        value = value.slice(0, 5) + ":" + value.slice(5);
      }

      dispatch(updateInput({ key: inputKey, value }));

      // Валидация после обновления состояния
      const [hourStr, minuteStr, secondStr] = value.split(":");

      let hour = parseInt(hourStr, 10);
      let minute = parseInt(minuteStr, 10);
      let second = parseInt(secondStr, 10);

      let error = "";

      if (hourStr && (isNaN(hour) || hour < 0 || hour > 23)) {
        error = "Часы должны быть от 0 до 23";
      }

      if (!error && minuteStr && (isNaN(minute) || minute < 0 || minute > 59)) {
        error = "Минуты должны быть от 0 до 59";
      }

      if (!error && secondStr && (isNaN(second) || second < 0 || second > 59)) {
        error = "Секунды должны быть от 0 до 59";
      }

      setError(error);

      if (error) {
        dispatch(setInputError({ key: inputKey, error }));
      } else {
        dispatch(clearInputError({ key: inputKey }));
      }
    } else {
      dispatch(updateInput({ key: inputKey, value }));

      if (iscity) {
        setIsLoading(true);
        setCitySuggestions([]);
        fetchCities(value);
      }
    }
  };

  const handleCitySelect = (city: CitySuggestion) => {
    dispatch(updateInput({ key: "city", value: city.display_name }));
    dispatch(updateInput({ key: "latitude", value: city.lat }));
    dispatch(updateInput({ key: "longitude", value: city.lon }));
    setCitySuggestions([]);
    setIsFocused(false);
    setIsLoading(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
    }, 200);
  };

  return (
    <div className="input-container">
      <input
        type="text"
        value={valueFromStore}
        onChange={handleInputChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
      />
      {error && <div className="error-message">{error}</div>}
      {iscity && isFocused && (
        <div className="suggestions">
          {isLoading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            citySuggestions.map((city, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleCitySelect(city)}
              >
                {city.display_name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
