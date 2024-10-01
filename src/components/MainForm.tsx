import React, { useEffect, useState } from "react";
import { Input } from "./InputComp";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoadAnimation } from "./LoadAnim";
import { toast } from "react-toastify";
import { Checkbox } from "@mui/material";
import { useDispatch } from "react-redux";
import { updateInput } from "../store/inputSlice";
import { API_URL } from "../static/constants/cons";
import { AUTH_API_URL } from "../static/constants/cons";

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

interface Access {
  code: string;
  message : string;
  status : string;
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



const pollForResult = (
  statusUrl: string
): Promise<{ result_url: string; task_id: string }> => {
  return new Promise((resolve, reject) => {
    let isPolling = true;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}${statusUrl}`);
        const data: PDFCompleteResponse = await response.json();

        if (data.result_url) {
          clearInterval(interval);
          isPolling = false;
          resolve({ result_url: data.result_url, task_id: data.task_id });

        }
      } catch (error) {
        clearInterval(interval);
        reject("Произошла ошибка при генерации файла");
      }
    }, 10000);

    setTimeout(() => {
      if (isPolling) {
        clearInterval(interval);
        reject("Произошел таймаут ожидания результата");
      }
    }, 60000);
  });
};

const MainForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const cons = searchParams.get("cons");
  const dispatch = useDispatch();
  const { values, errors } = useSelector((state: RootState) => state.inputs);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [knowTime, setKnowTime] = useState<boolean>(false);
  const [userDataSubmitted, setUserDataSubmitted] = useState<boolean>(false);
  const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);
  const [agree, setAgree] = useState<boolean>(false);
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

  const isSubmitDisabled =
    !!Object.keys(errors).length || !areAllFieldsFilled || !agree;

  useEffect(() => {
    const root = document.getElementById("root") as HTMLElement;
    root.style.overflowY = "hidden";
  }, []);

  const handleBirthtime = (event: React.ChangeEvent<HTMLInputElement>) => {
    knowTime
      ? dispatch(updateInput({ key: "time", value: "" }))
      : dispatch(updateInput({ key: "time", value: "12:00:00" }));
    setKnowTime(event.target.checked);
  };

  let consultation = "consultation";
  if (cons) {
    consultation += cons;
  }

  const handleUserDataSubmit = () => {
    if (isSubmitDisabled) {
      return;
    }
    setUserDataSubmitted(true);
  };

  const handleAgreement = () => {
    setAgree(!agree);
  };

  const handleEmailSubmit = async () => {
    if (errors.email) {
      return;
    }
    if (values.email && values.email.trim() !== "") {
      const payload = {
        email: values.email,
      };

      try {
        const response = await fetch(
        `${AUTH_API_URL}/api/v2/check_access`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const accessResponse: Access = await response.json();

        if (!accessResponse.status) {
          showToastError("Ошибка сервера");
          return;
        }

        if (accessResponse.status === "success" && accessResponse.code === "access_granted") {
          setIsLoading(true);
          const payload = {
            birth_date: values.date,
            birth_time: values.time,
            birth_city: values.city,
            birth_city_coordinates: `${values.latitude},${values.longitude}`,
            know_birth_time: !knowTime,
            name: values.name,
            selected_option: consultation,
          };
          try {
            const response = await fetch(
              `${API_URL}/api/v1/generate_pdf`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }
            );

            const data: PDFResponse = await response.json();
            const { result_url, task_id } = await pollForResult(
              data.status_url
            );

            const fileResponse = await fetch(
              `${API_URL}${result_url}`
            );
            const file: PDFFileReponse = await fileResponse.json();

            const confirmResponse = await fetch(
              `https://api.astroguru.ru/api/v2/confirm_generation`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: values.email }),
              }
            );
            if (!confirmResponse.ok) {
              throw new Error("Ошибка при подтверждении генерации");
            }

            navigate(
              `/pdf?pdfLink=${encodeURIComponent(
                file.file_url
              )}&taskId=${task_id}`
            );
          } catch (error) {
            showToastError(
              typeof error === "string"
                ? error
                : "Произошла ошибка при запросе на генерацию файла"
            );
          } finally {
            setIsLoading(false);
          }
        } else {
          showToastError("Вам не доступка генерация");
        }
      } catch (error) {
        showToastError("Ошибка при проверке доступа");
      }
    } else {
      showToastError("Пожалуйста, введите ваш email");
    }
  };

  return (
    <div className="content">
      {!isLoading ? (
        !userDataSubmitted ? (
          <>
            <div className="content-staticmsg">
              Введите данные своего рождения
            </div>
            <div className="content-inputs">
              <Input
                istime={true}
                placeholder="Время рождения - 12:00:00"
                inputKey="time"
              />
              <div className="content-agreement datetime">
                <Checkbox checked={knowTime} onChange={handleBirthtime} />
                <div>Я не помню время рождения</div>
              </div>
              <Input
                isdate={true}
                placeholder="Дата рождения - 05.05.1990"
                inputKey="date"
              />
              <Input
                iscity={true}
                placeholder="Населенный пункт"
                inputKey="city"
              />
              <Input placeholder="Имя человека или событие" inputKey="name" />
              <Input placeholder="Широта" inputKey="latitude" />
              <Input placeholder="Долгота" inputKey="longitude" />
            </div>
            <div className="content-agreement">
              <Checkbox checked={agree} onChange={handleAgreement} />
              <a href="/agreement">
                подтверждаю обработку данных и согласен с политикой
                конфиденциальности
              </a>
            </div>
            {isSubmitDisabled && (
              <div className="error-message">
                {Object.keys(errors).length
                  ? "Исправьте ошибки в форме"
                  : "Пожалуйста, заполните все поля"}
              </div>
            )}
            <div
              className={`content-send ${isSubmitDisabled ? "disabled" : ""}`}
              onClick={!isSubmitDisabled ? handleUserDataSubmit : undefined}
            >
              Продолжить
            </div>
          </>
        ) : !emailSubmitted ? (
          <>
            <div className="content-staticmsg">Введите свой email</div>
            <div className="content-inputs">
              <Input placeholder="email" inputKey="email" isEmail={true} />
            </div>
            <div
              className={`content-send email ${errors.email ? "disabled" : ""}`}
              onClick={!errors.email ? handleEmailSubmit : undefined}
            >
              Отправить
            </div>
          </>
        ) : null
      ) : (
        <LoadAnimation />
      )}
    </div>
  );
};

export default MainForm;
