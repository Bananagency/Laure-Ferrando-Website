<template>
    <section class="Contact__form">
        <!-- État de succès -->
        <div v-if="emailStatus === 'success'" class="Contact__form__success">
            <div class="Contact__form__success-icon">✓</div>
            <h2>Message envoyé avec succès !</h2>
            <p>
                Votre message a bien été envoyé. Nous vous répondrons dans les
                plus brefs délais.
            </p>
            <button @click="resetForm" class="Contact__form__success-button">
                Envoyer un nouveau message
            </button>
        </div>

        <!-- État d'erreur -->
        <div v-else-if="emailStatus === 'error'" class="Contact__form__error">
            <div class="Contact__form__error-icon">!</div>
            <h2>Erreur d'envoi</h2>
            <p>{{ errorMessage }}</p>
            <button
                @click="emailStatus = 'idle'"
                class="Contact__form__error-button"
            >
                Réessayer
            </button>
        </div>

        <!-- Formulaire normal -->
        <form v-else ref="form" id="contact-form" @submit.prevent="SendEmail">
            <div class="Contact__form__topic">
                <label for="name">Nom</label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    v-model="fields.name"
                    :disabled="emailStatus === 'sending'"
                />
                <span v-if="errors.name" class="Contact__form__error-text">{{
                    errors.name
                }}</span>
            </div>
            <div class="Contact__form__topic">
                <label for="surname">Prénom</label>
                <input
                    type="text"
                    name="surname"
                    id="surname"
                    v-model="fields.surname"
                    :disabled="emailStatus === 'sending'"
                />
                <span v-if="errors.surname" class="Contact__form__error-text">{{
                    errors.surname
                }}</span>
            </div>
            <div class="Contact__form__topic">
                <label for="email">Adresse mail</label>
                <input
                    type="text"
                    name="email"
                    id="email"
                    v-model="fields.email"
                    :disabled="emailStatus === 'sending'"
                />
                <span v-if="errors.email" class="Contact__form__error-text">{{
                    errors.email
                }}</span>
            </div>
            <div class="Contact__form__topic">
                <label for="subject">Sujet</label>
                <input
                    type="text"
                    name="subject"
                    id="subject"
                    v-model="fields.subject"
                    :disabled="emailStatus === 'sending'"
                />
                <span v-if="errors.subject" class="Contact__form__error-text">{{
                    errors.subject
                }}</span>
            </div>
            <div class="Contact__form__topic">
                <label for="message">Message</label>
                <textarea
                    name="message"
                    id="message"
                    v-model="fields.message"
                    :disabled="emailStatus === 'sending'"
                ></textarea>
                <span v-if="errors.message" class="Contact__form__error-text">{{
                    errors.message
                }}</span>
            </div>
            <button
                class="Contact__form__button"
                type="submit"
                :disabled="emailStatus === 'sending'"
                :class="{
                    'Contact__form__button--loading': emailStatus === 'sending',
                }"
            >
                <span v-if="emailStatus !== 'sending'">Envoyer</span>
                <span v-else class="Contact__form__button-loading">
                    <div class="Contact__form__button-spinner"></div>
                    Envoi en cours...
                </span>
            </button>
        </form>
    </section>
</template>

<script lang="ts" setup>
import emailjs from "@emailjs/browser";
import { ref } from "vue";

const form = ref();
const emailStatus = ref<"idle" | "sending" | "success" | "error">("idle");
const errorMessage = ref("");

const fields = ref({
    name: "",
    surname: "",
    email: "",
    subject: "",
    message: "",
});
const errors = ref({
    name: "",
    surname: "",
    email: "",
    subject: "",
    message: "",
});

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate() {
    errors.value = {
        name: fields.value.name ? "" : "Nom requis",
        surname: fields.value.surname ? "" : "Prénom requis",
        email: fields.value.email
            ? validateEmail(fields.value.email)
                ? ""
                : "Email invalide"
            : "Email requis",
        subject: fields.value.subject ? "" : "Sujet requis",
        message: fields.value.message ? "" : "Message requis",
    };
    return Object.values(errors.value).every((e) => !e);
}

const SendEmail = () => {
    if (!validate()) return;

    emailStatus.value = "sending";
    errorMessage.value = "";

    emailjs
        .sendForm(
            import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
            import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
            form.value,
            {
                publicKey: import.meta.env.PUBLIC_EMAILJS_KEY,
            },
        )
        .then(
            () => {
                emailStatus.value = "success";
            },
            (error) => {
                emailStatus.value = "error";
                errorMessage.value =
                    error?.text ||
                    "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.";
            },
        );
};

const resetForm = () => {
    // Réinitialiser les champs
    fields.value = {
        name: "",
        surname: "",
        email: "",
        subject: "",
        message: "",
    };

    // Réinitialiser les erreurs
    errors.value = {
        name: "",
        surname: "",
        email: "",
        subject: "",
        message: "",
    };

    // Réinitialiser le statut
    emailStatus.value = "idle";
    errorMessage.value = "";
};
</script>

<style lang="scss" scoped>
.Contact {
    &__form {
        background: white;
        padding: 2.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

        form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        &__topic {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            label {
                font-weight: 600;
                color: var(--text-color);
                font-size: 0.95rem;
                margin-bottom: 0.25rem;
            }

            input,
            textarea {
                border: 2px solid #e9ecef;
                font-size: 1rem;
                padding: 1rem 1.25rem;
                border-radius: 8px;
                transition: all 0.3s ease;
                font-family: inherit;
                background: #fafafa;

                &:focus {
                    outline: none;
                    border-color: var(--accent-color);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
                }

                &::placeholder {
                    color: #adb5bd;
                }

                &:disabled {
                    background: #f8f9fa;
                    color: #6c757d;
                    cursor: not-allowed;
                    border-color: #e9ecef;
                    opacity: 0.7;
                }
            }

            input {
                height: 3rem;
            }

            textarea {
                height: 8rem;
                resize: vertical;
                min-height: 6rem;
                max-height: 12rem;
            }
        }

        &__button {
            border: none;
            background: linear-gradient(
                135deg,
                var(--accent-color) 0%,
                #007bff 100%
            );
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            padding: 1rem 2rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;

            &::before {
                content: "";
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.2),
                    transparent
                );
                transition: left 0.5s;
            }

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

                &::before {
                    left: 100%;
                }
            }

            &:active {
                transform: translateY(0);
            }
        }

        // États de succès et d'erreur
        &__success,
        &__error {
            text-align: center;
            padding: 3rem 2.5rem;
            background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

            @media screen and (max-width: 768px) {
                padding: 2rem;
            }

            h2 {
                margin: 1.5rem 0 1rem;
                font-size: 1.75rem;
                font-weight: 700;
                color: #2d2d2d;

                @media screen and (max-width: 768px) {
                    font-size: 1.5rem;
                }
            }

            p {
                color: #666;
                margin-bottom: 2rem;
                font-size: 1.1rem;
                line-height: 1.6;
            }
        }

        &__success {
            &-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto;
                background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                font-weight: bold;
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
                animation: successPulse 2s ease-in-out infinite;
            }

            &-button {
                padding: 1rem 2rem;
                background: linear-gradient(
                    135deg,
                    var(--accent-color) 0%,
                    #007bff 100%
                );
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
                font-size: 1rem;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                font-family: inherit;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                }

                &:active {
                    transform: translateY(0);
                }
            }
        }

        &__error {
            &-icon {
                width: 80px;
                height: 80px;
                margin: 0 auto;
                background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2.5rem;
                font-weight: bold;
                box-shadow: 0 6px 20px rgba(244, 67, 54, 0.3);
                animation: errorShake 0.5s ease-in-out;
            }

            &-button {
                padding: 1rem 2rem;
                background: linear-gradient(
                    135deg,
                    var(--accent-color) 0%,
                    #007bff 100%
                );
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
                font-size: 1rem;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                font-family: inherit;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                }

                &:active {
                    transform: translateY(0);
                }
            }

            &-text {
                color: #dc3545;
                font-size: 0.9rem;
                font-weight: 500;
                margin-top: 0.5rem;
                display: block;
            }
        }

        &__button {
            &--loading {
                opacity: 0.8;
                cursor: not-allowed;
                transform: none;

                &:hover {
                    transform: none;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                }
            }

            &-loading {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
            }

            &-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
        }
    }
}

// Animations
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@keyframes successPulse {
    0%,
    100% {
        transform: scale(1);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
    }
}

@keyframes errorShake {
    0%,
    100% {
        transform: translateX(0);
    }
    25% {
        transform: translateX(-5px);
    }
    75% {
        transform: translateX(5px);
    }
}

@media screen and (min-width: 768px) {
    .Contact {
        &__form {
            &__topic {
                &:nth-child(1),
                &:nth-child(2) {
                    flex: 1;
                }
            }

            form {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;

                .Contact__form__topic:nth-child(1),
                .Contact__form__topic:nth-child(2) {
                    grid-column: span 1;
                }

                .Contact__form__topic:nth-child(3),
                .Contact__form__topic:nth-child(4),
                .Contact__form__topic:nth-child(5) {
                    grid-column: span 2;
                }
            }

            &__button {
                grid-column: span 2;
                justify-self: start;
                width: auto;
                min-width: 200px;
            }
        }
    }
}

@media screen and (min-width: 992px) {
    .Contact {
        &__form {
            flex: 1;
            align-self: flex-start;

            form {
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
            }

            &__button {
                width: auto;
                align-self: flex-start;
            }
        }
    }
}

@media screen and (min-width: 1200px) {
    .Contact {
        &__form {
            padding: 3rem;
        }
    }
}
</style>
