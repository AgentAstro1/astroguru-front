import React, { useEffect, useState } from "react";
import { Input } from "./InputComp";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { LoadAnimation } from "./LoadAnim";
import { toast } from "react-toastify";
import { CheckBox } from "@mui/icons-material";
import { Checkbox } from "@mui/material";

interface PDFResponse {
  status_url: string;
  task_id: string;
}

interface PDFCompleteResponse {
  status: string;
  task_id: string;
  progress?: number;
  result_url?: string;
}

interface PDFFileReponse {
  file_url: string;
}

const showToastError = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

const pollForResult = (statusUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    let isPolling = true;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`https://astroacademy1.com${statusUrl}`);
        const data: PDFCompleteResponse = await response.json();

        if (data.result_url) {
          clearInterval(interval);
          isPolling = false;
          resolve(data.result_url);
        } else {
          console.log(
            `Генерация продолжается. Статус: ${data.status}, Прогресс: ${
              data.progress || 0
            }%`
          );
        }
      } catch (error) {
        clearInterval(interval);
        reject("Произошла ошибка при генерации файла");
      }
    }, 5000);

    setTimeout(() => {
      if (isPolling) {
        clearInterval(interval);
        reject("Произошел таймаут ожидания результата");
      }
    }, 60000);
  });
};

const MainForm: React.FC = () => {
  const { values, errors } = useSelector((state: RootState) => state.inputs);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const requiredFields = [
    "date",
    "time",
    "city",
    "name",
    "latitude",
    "longitude",
  ];
  const areAllFieldsFilled = requiredFields.every(
    (key) => values[key] && values[key].trim() !== ""
  );

  const isSubmitDisabled = !!Object.keys(errors).length || !areAllFieldsFilled;

  useEffect(() => {
    const root = document.getElementById("root") as HTMLElement;
    root.style.overflowY = "hidden";
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true);
    const payload = {
      birth_date: values.date,
      birth_time: values.time,
      birth_city: values.city,
      birth_city_coordinates: `${values.latitude},${values.longitude}`,
      know_birth_time: true,
      name: values.name,
      selected_option: "consultation",
    };

    try {
      const response = await fetch(
        "https://astroacademy1.com/api/v1/generate_pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data: PDFResponse = await response.json();
      const resultUrl = await pollForResult(data.status_url);

      const fileResponse = await fetch(`https://astroacademy1.com${resultUrl}`);
      const file: PDFFileReponse = await fileResponse.json();

      navigate(`/pdf?pdfLink=${encodeURIComponent(file.file_url)}`);
    } catch (error) {
      showToastError(
        typeof error === "string"
          ? error
          : "Произошла ошибка при запросе на генерацию файла"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content">
      {!isLoading ? (
        <>
          {isSubmitDisabled && (
            <div className="error-message">
              {Object.keys(errors).length
                ? "Исправьте ошибки в форме"
                : "Пожалуйста, заполните все обязательные поля"}
            </div>
          )}
          <Input
            istime={true}
            placeholder="Время рождения - 12:00:00"
            inputKey="time"
          />
          <Input
            isdate={true}
            placeholder="Дата рождения - 05.05.1990"
            inputKey="date"
          />
          <Input iscity={true} placeholder="Населенный пункт" inputKey="city" />
          <Input placeholder="Имя человека или событие" inputKey="name" />
          <Input placeholder="Широта" inputKey="latitude" />
          <Input placeholder="Долгота" inputKey="longitude" />
          <div className="content-agreement">
            <Checkbox />
            <a href="/agreement">
              подтверждаю обработку данных и согласен с политикой
              конфиденциальности
            </a>
          </div>
          <div
            className={`content-send ${isSubmitDisabled ? "disabled" : ""}`}
            onClick={!isSubmitDisabled ? handleSubmit : undefined}
          >
            Прогноз
          </div>
        </>
      ) : (
        <LoadAnimation />
      )}
    </div>
  );
};

export default MainForm;