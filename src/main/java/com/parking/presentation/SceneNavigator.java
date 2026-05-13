package com.parking.presentation;

import com.parking.application.AppContext;
import javafx.stage.Stage;

public class SceneNavigator {
    private final Stage stage;
    private final AppContext context;

    public SceneNavigator(Stage stage, AppContext context) {
        this.stage = stage;
        this.context = context;
    }

    public AppContext context() {
        return context;
    }

    public void show(View view) {
        stage.setScene(view.buildScene());
    }
}
