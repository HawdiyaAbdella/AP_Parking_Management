package com.parking.presentation.ui;

import com.parking.domain.model.ParkingSlot;
import com.parking.domain.model.Reservation;
import com.parking.domain.model.SlotStatus;
import com.parking.presentation.SceneNavigator;
import com.parking.presentation.View;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;

import java.util.List;

public class AdminDashboardView implements View {
    private final SceneNavigator navigator;

    public AdminDashboardView(SceneNavigator navigator) {
        this.navigator = navigator;
    }

    @Override
    public Scene buildScene() {
        BorderPane root = new BorderPane();
        root.setPadding(new Insets(16));

        Label title = new Label("Admin Dashboard - " + navigator.context().currentUser().username());
        title.setStyle("-fx-font-size: 18; -fx-font-weight: bold;");

        Button logout = new Button("Logout");
        logout.setOnAction(e -> {
            navigator.context().logout();
            navigator.show(new LoginView(navigator));
        });

        root.setTop(new HBox(12, title, logout));

        ListView<String> slotsList = new ListView<>();
        List<ParkingSlot> slots = navigator.context().slotUseCase().getAllSlots();
        long availableCount = slots.stream().filter(slot -> slot.status() == SlotStatus.AVAILABLE).count();
        long occupiedCount = slots.stream().filter(slot -> slot.status() == SlotStatus.OCCUPIED).count();
        long reservedCount = slots.stream().filter(slot -> slot.status() == SlotStatus.RESERVED).count();

        slots.forEach(slot -> slotsList.getItems().add("Slot " + slot.id() + " - " + slot.name() + " - " + slot.status()));

        Label stats = new Label("Available: " + availableCount + " | Occupied: " + occupiedCount + " | Reserved: " + reservedCount);

        TextField slotName = new TextField();
        slotName.setPromptText("New slot name (e.g., C1)");
        Button addSlot = new Button("Add Slot");
        addSlot.setOnAction(e -> {
            navigator.context().slotUseCase().addSlot(slotName.getText());
            navigator.show(new AdminDashboardView(navigator));
        });

        TextField slotIdField = new TextField();
        slotIdField.setPromptText("Slot ID");
        ComboBox<SlotStatus> statusCombo = new ComboBox<>();
        statusCombo.getItems().addAll(SlotStatus.values());
        statusCombo.setValue(SlotStatus.AVAILABLE);
        Button updateStatus = new Button("Update Status");
        updateStatus.setOnAction(e -> {
            int slotId = Integer.parseInt(slotIdField.getText());
            navigator.context().slotUseCase().updateSlotStatus(slotId, statusCombo.getValue());
            navigator.show(new AdminDashboardView(navigator));
        });

        ListView<String> reservationsList = new ListView<>();
        for (Reservation reservation : navigator.context().reservationUseCase().getAllReservations()) {
            reservationsList.getItems().add(
                    "Res#" + reservation.id() +
                    " User:" + reservation.userId() +
                    " Slot:" + reservation.slotId() +
                    " Status:" + reservation.status()
            );
        }

        VBox left = new VBox(10,
                stats,
                new Label("All Parking Slots"),
                slotsList,
                new HBox(10, slotName, addSlot),
                new HBox(10, slotIdField, statusCombo, updateStatus)
        );
        VBox.setVgrow(slotsList, Priority.ALWAYS);

        VBox right = new VBox(10, new Label("All Reservations"), reservationsList);
        VBox.setVgrow(reservationsList, Priority.ALWAYS);

        HBox center = new HBox(20, left, right);
        HBox.setHgrow(left, Priority.ALWAYS);
        HBox.setHgrow(right, Priority.ALWAYS);
        root.setCenter(center);

        return new Scene(root, 1100, 700);
    }
}
