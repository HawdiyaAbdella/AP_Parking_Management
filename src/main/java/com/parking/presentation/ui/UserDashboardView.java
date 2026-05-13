package com.parking.presentation.ui;

import com.parking.domain.model.ParkingSlot;
import com.parking.domain.model.Reservation;
import com.parking.domain.model.SlotStatus;
import com.parking.presentation.SceneNavigator;
import com.parking.presentation.View;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;

import java.time.format.DateTimeFormatter;
import java.util.List;

public class UserDashboardView implements View {
    private final SceneNavigator navigator;

    public UserDashboardView(SceneNavigator navigator) {
        this.navigator = navigator;
    }

    @Override
    public Scene buildScene() {
        BorderPane root = new BorderPane();
        root.setPadding(new Insets(16));

        Label title = new Label("User Dashboard - " + navigator.context().currentUser().username());
        title.setStyle("-fx-font-size: 18; -fx-font-weight: bold;");

        Button logout = new Button("Logout");
        logout.setOnAction(e -> {
            navigator.context().logout();
            navigator.show(new LoginView(navigator));
        });

        HBox top = new HBox(12, title, logout);
        root.setTop(top);

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);

        List<ParkingSlot> slots = navigator.context().slotUseCase().getAllSlots();
        for (int i = 0; i < slots.size(); i++) {
            ParkingSlot slot = slots.get(i);
            Button slotButton = new Button(slot.name() + "\n" + slot.status());
            slotButton.setPrefSize(120, 70);
            slotButton.setStyle(styleForStatus(slot.status()));
            slotButton.setDisable(slot.status() != SlotStatus.AVAILABLE);
            int slotId = slot.id();
            slotButton.setOnAction(e -> {
                try {
                    navigator.context().slotUseCase().reserveSlot(navigator.context().currentUser().id(), slotId);
                    navigator.show(new UserDashboardView(navigator));
                } catch (Exception ex) {
                    slotButton.setText("Failed\n" + slot.name());
                }
            });
            grid.add(slotButton, i % 4, i / 4);
        }

        VBox left = new VBox(10, new Label("Parking Slots (click green to reserve)"), grid);
        left.setPadding(new Insets(10));

        ListView<String> reservationList = new ListView<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (Reservation r : navigator.context().reservationUseCase().getReservationsByUser(navigator.context().currentUser().id())) {
            double fee = navigator.context().reservationUseCase().calculateFee(r);
            reservationList.getItems().add(
                    "Res#" + r.id() + " Slot:" + r.slotId() + " " + r.status() +
                    " Start:" + r.startTime().format(formatter) +
                    " Fee:" + fee
            );
        }

        TextFieldWithButton releaseForm = new TextFieldWithButton("Slot ID", "Release", slotId -> {
            navigator.context().slotUseCase().releaseSlot(slotId);
            navigator.show(new UserDashboardView(navigator));
        });

        TextFieldWithButton cancelForm = new TextFieldWithButton("Slot ID", "Cancel Reservation", slotId -> {
            navigator.context().slotUseCase().cancelReservation(slotId);
            navigator.show(new UserDashboardView(navigator));
        });

        VBox right = new VBox(10,
                new Label("My Reservations"),
                reservationList,
                releaseForm.view(),
                cancelForm.view()
        );
        VBox.setVgrow(reservationList, Priority.ALWAYS);

        HBox center = new HBox(20, new ScrollPane(left), right);
        HBox.setHgrow(right, Priority.ALWAYS);
        HBox.setHgrow(left, Priority.ALWAYS);

        root.setCenter(center);
        return new Scene(root, 1100, 700);
    }

    private String styleForStatus(SlotStatus status) {
        return switch (status) {
            case AVAILABLE -> "-fx-background-color: #54d66a; -fx-font-weight: bold;";
            case OCCUPIED -> "-fx-background-color: #f25555; -fx-font-weight: bold;";
            case RESERVED -> "-fx-background-color: #f4d35e; -fx-font-weight: bold;";
        };
    }
}
