package com.parking.presentation.ui;

import javafx.scene.control.Button;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;

import java.util.function.IntConsumer;

public class TextFieldWithButton {
    private final HBox view;

    public TextFieldWithButton(String prompt, String buttonText, IntConsumer action) {
        TextField field = new TextField();
        field.setPromptText(prompt);

        Button button = new Button(buttonText);
        button.setOnAction(event -> {
            int value = Integer.parseInt(field.getText());
            action.accept(value);
        });

        this.view = new HBox(8, field, button);
    }

    public HBox view() {
        return view;
    }
}
