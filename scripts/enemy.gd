@tool
extends CharacterBody2D

@export var boss := false
@export var move_speed := 55.0
var direction := -1.0
var health := 3
var max_health := 3
var start_x := 0.0
var attack_cooldown := 1.8
var enraged := false

func _ready() -> void:
    start_x = global_position.x
    if boss:
        max_health = 8
        health = max_health
    queue_redraw()

func _physics_process(delta: float) -> void:
    if Engine.is_editor_hint():
        queue_redraw()
        return
    velocity += get_gravity() * delta
    if boss:
        attack_cooldown -= delta
        var target := get_tree().get_first_node_in_group("player") as CharacterBody2D
        if target and attack_cooldown <= 0.0 and is_on_floor():
            direction = signf(target.global_position.x - global_position.x)
            velocity.y = -470.0 if not enraged else -560.0
            attack_cooldown = 2.2 if not enraged else 1.35
    velocity.x = direction * (move_speed if not boss else move_speed * 0.72)
    move_and_slide()
    if abs(global_position.x - start_x) > (130.0 if not boss else 210.0):
        direction *= -1.0
    for index in get_slide_collision_count():
        var collision := get_slide_collision(index)
        if collision.get_collider().has_method("take_damage"):
            collision.get_collider().take_damage(25)
    queue_redraw()

func hit() -> void:
    health -= 1
    if boss and not enraged and health <= max_health / 2:
        enraged = true
        move_speed *= 1.35
    if health <= 0:
        queue_free()

func _draw() -> void:
    var size := 34.0 if boss else 23.0
    var color := Color("#7d5260") if boss else Color("#314e52")
    draw_circle(Vector2(0, -size * 0.35), size, color)
    draw_rect(Rect2(-size, 0, size * 2.0, size), color, true)
    draw_circle(Vector2(-size * 0.35, -size * 0.45), 4.0, Color("#f4c95d"))
    draw_circle(Vector2(size * 0.35, -size * 0.45), 4.0, Color("#f4c95d"))
    var bar_width := 84.0 if boss else 52.0
    var bar_y := -58.0 if boss else -38.0
    draw_rect(Rect2(-bar_width / 2.0, bar_y, bar_width, 7), Color("#202b38"), true)
    draw_rect(Rect2(-bar_width / 2.0, bar_y, bar_width * health / float(max_health), 7), Color("#e86f51"), true)
