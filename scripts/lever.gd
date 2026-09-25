extends Area2D

signal pulled
var active := false
var player_near := false

func _ready() -> void:
    body_entered.connect(_on_body_entered)
    body_exited.connect(_on_body_exited)
    queue_redraw()

func _unhandled_input(event: InputEvent) -> void:
    if player_near and event.is_action_pressed("jump") and not active:
        active = true
        pulled.emit()
        queue_redraw()

func _on_body_entered(body: Node) -> void:
    if body.has_method("take_damage"):
        player_near = true

func _on_body_exited(body: Node) -> void:
    if body.has_method("take_damage"):
        player_near = false

func _draw() -> void:
    draw_rect(Rect2(-13, 3, 26, 8), Color("#263238"), true)
    draw_line(Vector2(0, 4), Vector2(0, -22 if not active else -10), Color("#e86f51"), 7.0)
    draw_circle(Vector2(0, -23 if not active else -11), 7.0, Color("#f4c95d"))
