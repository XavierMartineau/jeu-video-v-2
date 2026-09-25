extends AnimatableBody2D

@export var travel := Vector2(0, 120)
@export var duration := 2.4
var origin := Vector2.ZERO
var elapsed := 0.0

func _ready() -> void:
    origin = global_position
    queue_redraw()

func _physics_process(delta: float) -> void:
    elapsed = fmod(elapsed + delta, duration * 2.0)
    var phase := elapsed / duration
    if phase > 1.0:
        phase = 2.0 - phase
    global_position = origin.lerp(origin + travel, phase)

func _draw() -> void:
    draw_rect(Rect2(-75, -10, 150, 20), Color("#4aa3a2"), true)
    draw_line(Vector2(-65, -3), Vector2(65, -3), Color("#b8f2e6"), 3.0)
