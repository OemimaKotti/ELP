-- Imports des modules nécessaires

module Main exposing (..)

import Browser
import Html exposing (Html, text, blockquote, div, h1, input, button, label, ul, li)
import Html.Events exposing (onInput, onClick)
import Html.Attributes exposing (placeholder, value, style, type_)
import Http
import Random
import List exposing (concatMap)
import List.Extra exposing (getAt)
import Json.Decode exposing (Decoder, field, string, list, map2)

-- FUNCTION

getRandomWord : List String -> Int -> String
getRandomWord list x =
    Maybe.withDefault "invalid word" <| Maybe.map (\a -> a) (List.Extra.getAt x list)

getDefinition : String -> Cmd Msg
getDefinition word =
    Http.get
        { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
        , expect = Http.expectJson GotDefinition definitionDecoder
        }

definitionDecoder : Decoder (List Definition)
definitionDecoder =
    list definitionDecoding

definitionDecoding : Decoder Definition
definitionDecoding =
    map2 Definition
        (field "word" string)
        (field "meanings" (list meaningDecoding))

meaningDecoding : Decoder Meaning
meaningDecoding =
    map2 Meaning
        (field "partOfSpeech" string)
        (field "definitions" (list (field "definition" string)))


-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none

-- DEFINITION DES TYPES -------------------------------------------------------

-- MODEL

type alias Model =
    { userInput : String
    , randomWord : String
    , words : String
    , showAnswer : Bool
    , definitions : List Definition
    , state : State
    }

-- Type pour représenter l'état de l'application

type State
    = Loading
    | Success
    | FailureText
    | FailureDef

-- Type pour représenter une définition

type alias Definition =
    { word : String
    , meanings : List Meaning
    }
-- Type pour représenter une signification

type alias Meaning =
    { partOfSpeech : String
    , definitions : List String
    }


-- INITIALISATION ---------------------------------------------------------------

init : () -> ((Model, Cmd Msg))
init _ =
    ( Model "" "" "" False [] Loading
    , Http.get
        { url = "/texte.txt"
        , expect = Http.expectString GotText
        }
    )


-- MISE A JOUR ------------------------------------------------------------------
-- Messages pouvant être émis par l'application

type Msg
    = GotText (Result Http.Error String)
    | WordNumber Int
    | GotDefinition (Result Http.Error (List Definition))
    | ChangeInput String
    | ToggleShowAnswer
    | RequestNewWord
    | CheckGuess
-- Fonction de mise à jour de l'application

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
    case msg of
            
        -- Traitement du résultat de la récupération du texte
        GotText result ->
            case result of
                Ok fullText ->
                    let
                        words = String.join " " (String.words fullText)
                        newModel = { model | words = words }
                        randomIndex = Random.int 0 (List.length (String.words fullText) - 1)
                    in
                    (newModel, Random.generate WordNumber randomIndex)

                Err _ ->
                    ({ model | state = FailureText }, Cmd.none)

        -- Traitement du résultat de la récupération des définitions
        GotDefinition result ->
            let
                (newModel, newCmd) =
                    case result of
                        Ok definition ->
                            ({ model | definitions = definition, state = Success }, Cmd.none)

                        Err _ ->
                            ({ model | state = FailureDef }, Cmd.none)
            in
            (newModel, newCmd)

        -- Mise à jour de l'entrée utilisateur
        ChangeInput newInput ->
            ( { model | userInput = newInput }, Cmd.none )

        -- Basculer l'affichage de la réponse
        ToggleShowAnswer ->
            ( { model | showAnswer = not model.showAnswer }, Cmd.none )

        -- Requête d'un nouveau mot aléatoire
        RequestNewWord ->
            init ()

        WordNumber number ->
            let
                newWord = getRandomWord (String.split " " model.words) number
                newModel = { model | randomWord = newWord }
            in
            ( newModel, getDefinition newWord )

        -- Vérification de la devinette
        CheckGuess ->
            let
                isCorrectGuess =
                    String.toLower model.userInput == String.toLower model.randomWord
                newStatus =
                    if isCorrectGuess then Success else FailureDef
                newMessage =
                    if isCorrectGuess then "Congratulation, t's true !" else "sorry! It's false."
            in
            ( { model | state = newStatus, userInput = newMessage }, Cmd.none )



-- AFFICHAGE ---------------------------------------------------------------------

view : Model -> Html Msg
view model =
    case model.state of
        Loading ->
            text "Chargement..."

        FailureText ->
            div [] [ text "Prombleme in charging the text file." ]

        FailureDef ->
             div [] [ text model.userInput ]

        Success ->
            let
                viewShowAnswer =
                    if not model.showAnswer then
                        h1 [] [ text "Guess word !" ]
                    else
                        h1 [] [ text model.randomWord ]

                viewDef : Definition -> List (Html Msg)
                viewDef def =
                    div [] [ text "Meaning :\n" ]
                        :: List.concatMap viewMeaning def.meanings

                viewMeaning : Meaning -> List (Html Msg)
                viewMeaning meaning =
                    div [] [ text meaning.partOfSpeech ]
                        :: List.map (\definition -> li [] [ text definition ]) meaning.definitions

                checkButton =
                    button [ onClick CheckGuess ] [ text "Check Word" ]
            in
            div []
                [ viewShowAnswer
                , div [] (List.concatMap viewDef model.definitions)
                , input [ placeholder "Enter a word", value model.userInput, onInput ChangeInput ] []
                , div [] [ input [ type_ "checkbox", onClick ToggleShowAnswer ] [], text "Show it" ]
                , checkButton
                ]


-- MAIN --------------------------------------------------------------------------

main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }
